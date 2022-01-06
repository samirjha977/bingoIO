
const validateToken = async (req, res, next) => {
    let token = req.body.token;
    if(token === "1fabd2c3-9f50-48a2-b9e5-96aba0577d72")  {
        next();
    } else {
        res.send({code: -1, message : "token-invalid"});
    };
}



module.exports = {
    validateToken: validateToken,
}