const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    let token = req.header("x-auth-token");
    if (!token) {
        const authHeader = req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        }
    }
    
    if (!token) return res.status(401).json({ error: "Brak tokena, autoryzacja odrzucona" });

    try {
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(401).json({ error: "Nieprawidłowy token" });
    }
};