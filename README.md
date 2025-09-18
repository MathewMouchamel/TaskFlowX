# 🎉 TaskFlowX: Make Your Tasks Dance! 🕺💃

Welcome to **TaskFlowX**, the task organizer that's so smooth, your to-dos will start humming show tunes. If you ever wanted a productivity app that’s as easy as pie, as fun as a trampoline park, and as useful as socks with pockets—**this is it**!

## 🚀 What Is TaskFlowX?

TaskFlowX helps you keep track of tasks, reminders, and deadlines with the grace of a professional juggler. It’s built for those who like things simple, joyful, and just a little bit magical. Whether you’re a student, a busy bee, or someone who likes to color-code their cereal boxes, this app is for you.

- **Organize tasks** with a snap!
- **Set reminders** and never forget your dentist appointment again.
- **Prioritize** like a pro: low, medium, high—because not all tasks are created equal.
- **Google Sign-In**: Because typing passwords is so 2020.
- **Real-time notifications** for tasks due soon.
- **Edit, complete, and delete tasks** with a click.
- **Sleek, modern UI** that makes your eyeballs do a happy dance.

## 🦄 Features That Sparkle

- **Google Authentication**: Sign in with your Google account and get right to business.
- **Create/Edit/Delete Tasks**: Everything you need, nothing you don’t.
- **Reminders & Notifications**: TaskFlowX keeps you in the loop.
- **Pretty Priorities**: Color-coded, easy to spot.
- **Due Dates**: So you can finally remember your best friend’s birthday.
- **Responsive Design**: Looks cool on your laptop, tablet, and even your grandma’s phone.

## 🍕 How Do I Use This Thing?

1. **Clone the repo**:  
   `git clone https://github.com/MathewMouchamel/TaskFlowX.git`

2. **Install dependencies**:  
   - For the frontend:  
     ```
     cd frontend
     npm install
     ```
   - For the backend:  
     ```
     cd backend
     npm install
     ```

3. **Set up your environment** (Backend):  
   - Add your MongoDB and Redis credentials to `.env`.
   - Set up Firebase credentials.

4. **Run the backend**:  
   ```
   cd backend
   npm start
   ```

5. **Run the frontend**:  
   ```
   cd frontend
   npm run dev
   ```

6. **Open your browser**:  
   Visit [http://localhost:3000](http://localhost:3000), sign in with Google, and start adding tasks!

## 📝 Main Files & Magic Spots

- **frontend/src/app/page.js**: Home page where all the action happens—add, edit, complete, and delete tasks.
- **frontend/src/components/Login.js**: Handles Google Sign-In with style.
- **frontend/src/lib/firebase.js**: Sets up Firebase authentication.
- **backend/index.js**: Node.js/Express backend, MongoDB for storage, Redis for reminders, Firebase for auth.
- **frontend/src/app/layout.js**: Layout and theming, because fonts matter.

## 🛠️ Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Redis, Firebase Admin
- **Auth**: Google Sign-In via Firebase
- **Notifications**: Redis-powered reminders

## 🎈 Fun Stuff

- The UI theme is “cool dark,” so you can look mysterious while crushing your to-do list.
- Buttons are round and bouncy. You might want to click them just for fun.
- Task completion animations: Each time you finish a task, a unicorn somewhere smiles.
- Priorities are color-coded (green, gray, blue)—so you know what’s hot and what’s not.

## 🤔 FAQ

**Q: Is it hard to use?**  
A: If you can eat a taco, you can use TaskFlowX.

**Q: Will I remember my tasks?**  
A: Yes! Notifications will gently nudge you (no angry robots involved).

## 📚 Want to Contribute?

Fork the repo, make it cooler, and send a PR. Add a meme, suggest a feature, or just say hi!

## 📢 License

This project currently does not have a license. Talk to the repo owner if you want to use it for world domination.

---

Made with ☕️, 😎, and a sprinkle of magic by [MathewMouchamel](https://github.com/MathewMouchamel).
