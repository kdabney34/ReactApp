using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    // inherintg from baseapicontroller gives extra api functionalities like REST and swagger ui
    public class AccountController : BaseApiController
    {
        private readonly UserManager<User> _userManager; // for user / role 
        private readonly TokenService _tokenService; // one of the features that inheriting from BaseApiController gets you
        private readonly StoreContext _context; // our database context file
        public AccountController(UserManager<User> userManager, TokenService tokenService, StoreContext context)
        { // dependency injection
            _context = context;
            _tokenService = tokenService;
            _userManager = userManager;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            // attempt login
            var user = await _userManager.FindByNameAsync(loginDto.Username);

            // if invalid credentials onlogin
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
                return Unauthorized();

            // test for duplicate baskets per user (would result in error)
            var userBasket = await RetrieveBasket(loginDto.Username);
            var anonBasket = await RetrieveBasket(Request.Cookies["buyerId"]); // from Axios cookies

            if (anonBasket != null) // check if we have duplicate baskets which we don't want for error purposes
            {
                if (userBasket != null) _context.Baskets.Remove(userBasket);  // we rather go by buyerId than username for baskets
                anonBasket.BuyerId = user.UserName; // update buyer id in basket
                Response.Cookies.Delete("buyerId");  // delete cookie  always after use
                await _context.SaveChangesAsync(); // save anonBasket to baskets table in db
            }

            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user), // validate request using API feature
                Basket = anonBasket != null ? anonBasket.MapBasketToDto() : userBasket?.MapBasketToDto()
                // if anonBasket not empty map it to new userDto. else, map userBasket to Dto, but its nullable so if it doesn't 
                // exist in this moment, an empty basket will be added which is good
            };
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDto registerDto)
        {
            var user = new User { UserName = registerDto.Username, Email = registerDto.Email };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }

                return ValidationProblem(); // return the error
            }

            await _userManager.AddToRoleAsync(user, "Member");

            return StatusCode(201); // request successful and as a result, new resource has been created = 201
        }

        [Authorize]
        [HttpGet("currentUser")]
        public async Task<ActionResult<UserDto>> GetCurrentUser() // return type actionResult using(creating) a userDto
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var userBasket = await RetrieveBasket(User.Identity.Name);

            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket = userBasket?.MapBasketToDto() // if userBasket is null then map empty basket to new User
            };
        }

        [Authorize]
        [HttpGet("savedAddress")]
        public async Task<ActionResult<UserAddress>> GetSavedAddress()
        {
            // generic EFC query methods 
            return await _userManager.Users
                .Where(x => x.UserName == User.Identity.Name)
                .Select(user => user.Address)
                .FirstOrDefaultAsync();
        }

        private async Task<Basket> RetrieveBasket(string buyerId) // buyerId is stored in Response.Cookies for use getting basket
        {
            if (string.IsNullOrEmpty(buyerId))
            {
                Response.Cookies.Delete("buyerId"); // always remember to delete cookie after use
                return null;
            }

            return await _context.Baskets
                .Include(i => i.Items)
                .ThenInclude(p => p.Product)
                .FirstOrDefaultAsync(x => x.BuyerId == buyerId);
        }
    }
}