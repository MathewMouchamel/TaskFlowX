"use client";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="roboto-condensed-custom text-7xl"
      >
        TaskFlowX
      </motion.h1>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        className="roboto-condensed-custom px-8 py-3 border border-white text-white text-2xl rounded-full transition-colors duration-200 cursor-pointer"
      >
        Start
      </motion.button>
    </div>
  );
}
