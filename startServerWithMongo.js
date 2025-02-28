let express = require('express');
let app = express();
const bcrypt = require('bcrypt');
const User = require('./models/user');
const { MongoClient, ServerApiVersion } = require('mongodb') // Optional if using express-async-handler

// const uri = "mongodb://localhost:27017";
const uri = "mongodb+srv://wandabwafaith:Mukongolo2472@cluster0.anov8lm.mongodb.net/"
// const uri = "mongodb+srv://s223749059:2fICYltL4sfxoG1M@cluster0.tjcoayf.mongodb.net/"
let port = process.env.port || 3000;
let collection;

app.use(express.static(__dirname + '/public'))
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function runDBConnection() {
    try {
        await client.connect();
        collection = client.db().collection('Cat');
        console.log(collection);
    } catch(ex) {
        console.error(ex);
    }
}

app.get('/', function (req,res) {
    res.render('indexMongo.html');
});

app.get('/api/cats', (req,res) => {
    getAllCats((err,result)=>{
        if (!err) {
            res.json({statusCode:200, data:result, message:'get all cats successful'});
        }
    });
});

app.post('/api/cat', (req,res)=>{
    let cat = req.body;
    postCat(cat, (err, result) => {
        if (!err) {
            res.json({statusCode:201, data:result, message:'success'});
        }
    });
});

function postCat(cat,callback) {
    collection.insertOne(cat,callback);
}

function getAllCats(callback){
    collection.find({}).toArray(callback);
}

app.get('/login', (req, res) => {
    res.render('login.html');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).send('Invalid username or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).send('Invalid username or password');
    }
    // Create and send an authentication token
    const token = createAuthToken(user);
    res.status(200).send({ token });
});

app.get('/register', (req, res) => {
    res.render('register.html');
});
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try{
        // Check for missing fields
        if (!username || !email || !password) {
            throw new Error('Username, email, and password are required.');
        }
    
        // Check if username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new Error('Username already exists');
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user
        await User.insertOne({
            username,
            email,
            password: hashedPassword
        });
        res.send('Registration successful');
    }catch(err){
        return res.status(400).json({ error: err.message }); // Use JSON for structured response
        
    }
});

const jwt = require('jsonwebtoken');
const secretKey = "GroupKey";
function createAuthToken(user) {
    const payload = { userId: user._id };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

app.listen(port, ()=>{
    console.log('express server started');
    runDBConnection();
});
