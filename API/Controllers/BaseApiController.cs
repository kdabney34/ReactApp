using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // anything inheriting from this class will have its route modified thru this Route attribute
    public class BaseApiController : ControllerBase
    {
        
    }
}