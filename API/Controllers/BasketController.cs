using System;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class BasketController : BaseApiController
    {
        private readonly StoreContext _context;
        public BasketController(StoreContext context)
        {
            _context = context;
        }

        [HttpGet(Name = "GetBasket")]
        public async Task<ActionResult<BasketDto>> GetBasket()
        {
            var basket = await RetrieveBasket(GetBuyerId());

            if (basket == null) return NotFound();

            return basket.MapBasketToDto();
        }

        [HttpPost]
        public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
        {
            var basket = await RetrieveBasket(GetBuyerId());

            if (basket == null) basket = CreateBasket();

            var product = await _context.Products.FindAsync(productId);

            if (product == null) return BadRequest(new ProblemDetails { Title = "Product not found" });

            basket.AddItem(product, quantity);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return CreatedAtRoute("GetBasket", basket.MapBasketToDto());

            return BadRequest(new ProblemDetails { Title = "Problem saving item to basket" });
        }

        [HttpDelete]
        public async Task<ActionResult> RemoveBasketItem(int productId, int quantity)
        {
            var basket = await RetrieveBasket(GetBuyerId()); // defined at bottom of this page
                                // RetrieveBasket() located in AccountController so same namespace as this one
            if (basket == null) return NotFound();

            basket.RemoveItem(productId, quantity);

            var result = await _context.SaveChangesAsync() > 0; // so if db was saved, result = true, else = false

            if (result) return Ok(); 

            return BadRequest(new ProblemDetails { Title = "Problem removing item from the basket" });
        }

        private async Task<Basket> RetrieveBasket(string buyerId)
        {
            if (string.IsNullOrEmpty(buyerId))
            {
                Response.Cookies.Delete("buyerId"); // Response.Cookies are available anywhere with the Axios CDN import
                return null;                         // like a redux store
            }

            return await _context.Baskets
                .Include(i => i.Items) // include the object 'Items' properties along with it
                .ThenInclude(p => p.Product)
                .FirstOrDefaultAsync(x => x.BuyerId == buyerId); 
        }

        private Basket CreateBasket() // return type basket fn name CreateBasket, at this point the user must be logged in
        {
            var buyerId = User.Identity?.Name; //-------------------BUYER ID == USER.NAME !!!----------------------------------------
            if (string.IsNullOrEmpty(buyerId))
            {
                buyerId = Guid.NewGuid().ToString();

                // CookieOptions comes from .net core http lib
                var cookieOptions = new CookieOptions { IsEssential = true, Expires = DateTime.Now.AddDays(30) };
                Response.Cookies.Append("buyerId", buyerId, cookieOptions);
            }
            var basket = new Basket { BuyerId = buyerId };
            _context.Baskets.Add(basket);
            return basket;
        }

        private string GetBuyerId()
        { // buyerId == User's name for now since non production scale 
            return User.Identity?.Name ?? Request.Cookies["buyerId"]; 
            // ?? = null coalescing operator, expands to user.identity.name != null ? user.identity.name : request.cookies['buyerId']
        }
    }
}