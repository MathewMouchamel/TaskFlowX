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
    </div>
  );
}
