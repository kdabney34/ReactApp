using System;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class BuggyController : BaseApiController //inherit baseapicontroller which inherits ControllerBase class which inherits
    {                               // IController class which calls Execute() which sends requests in each context
        [HttpGet("not-found")] // == when using standard ts requests obj, this method is named 'not-found' with request type = GET
        public ActionResult GetNotFound()
        {
            return NotFound();
        }

        [HttpGet("bad-request")] // == when using standard ts requests obj, this method is named 'bad-request' with request type = GET
        public ActionResult GetBadRequest()
        {
            return BadRequest(new ProblemDetails{Title = "This is a bad request"});
        }

        [HttpGet("unauthorised")] // == when using standard ts requests obj, this method is named 'unauthorised' with request type = GET
        public ActionResult GetUnauthorised()
        {
            return Unauthorized();
        }

        [HttpGet("validation-error")] // == when using standard ts requests obj, this method is named 'validation-error' with request type = GET
        public ActionResult GetValidationError()
        {
            ModelState.AddModelError("Problem1", "This is the first error"); // add errorName Problem 1 to errors collection with string "this is......"
            ModelState.AddModelError("Problem2", "This is the second error"); //we apply logic later in the views that trigger these errors IFF the logic isn't happy with the user input
            return ValidationProblem();                                       //at that point we can call Problem2 id that displays that "this is..." text to the user so they know the problem
        }

        [HttpGet("server-error")] // == when using standard ts requests obj, this method is named 'server-error' with request type = GET
        public ActionResult GetServerError()
        {
            throw new Exception("This is a server error");  //displays this error which comes from .net sdk instead of entity framework core's native 'addmodelerror' functionality
        }
    }
}