import Cors from 'micro-cors';

const cors = Cors({
    allowedMethods: ['POST'], // Specify the HTTP methods your API allows
    origin: '*', // Replace with your allowed origins or '*' to allow all
});

export default cors;