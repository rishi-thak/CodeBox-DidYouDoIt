import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import assignmentRoutes from './routes/assignments';
import groupRoutes from './routes/groups';
import userRoutes from './routes/users';

const app = express();

app.use(cors({
     origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
     credentials: true,
     optionsSuccessStatus: 200
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
     res.send('API is running');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
     app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
     });
}

export default app;
