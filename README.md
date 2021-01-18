# ridersregistration

# Routes
GET
--get all SMS
/
 
POST
--add record
/api/sendSMS
{
    message,
    number
}
 
 # login
-POST
/api/login
{
    username,
    password
}

# save user
/api/saveUser
{
    firstName,
    lastName,
    userName,
    password
}