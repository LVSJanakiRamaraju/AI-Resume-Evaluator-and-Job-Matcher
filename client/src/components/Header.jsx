import React, { useState } from "react";
import Modal from "./Modal";
import logoSrc from "../assets/logo.png";
import { FiLogOut, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Header({ user, onLogout }) {
  const [logoOpen, setLogoOpen] = useState(false);

  return (
    <header className="
        bg-gradient-to-r from-blue-600 to-blue-500
        dark:from-slate-900 dark:to-slate-800
        text-white px-6 py-4 flex justify-between items-center
        shadow-md backdrop-blur-sm border-b border-blue-400/20 dark:border-slate-700/40
      ">
      
      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          aria-label="Open logo"
          onClick={() => setLogoOpen(true)}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 rounded-full overflow-hidden bg-white/20 dark:bg-white/5 
            flex items-center justify-center border border-white/20 backdrop-blur-md"
        >
          <img src={logoSrc} alt="logo" className="w-9 h-9 object-contain" />
        </motion.button>

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold leading-tight">
            Welcome, <span className="font-bold">{user ? user.name : "..."}</span>
          </h1>
          <p className="text-xs opacity-80">
            Empowering your career — smart resume insights 🚀
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="flex items-center gap-2 pr-2 border-r border-white/30">
          <div className="
              w-10 h-10 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm 
              flex items-center justify-center
            ">
            <FiUser className="text-xl text-white/90" />
          </div>
        </div>

        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="
            flex items-center gap-2 text-blue-600 bg-white
            px-4 py-2 rounded-lg font-medium
            shadow-sm hover:shadow-md transition
            dark:bg-slate-100 dark:text-slate-800
          "
        >
          <FiLogOut className="text-lg" />
          Logout
        </motion.button>
      </div>

      <Modal
        open={logoOpen}
        title="App Logo"
        onClose={() => setLogoOpen(false)}
        className="max-w-sm"
      >
        <div className="flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 rounded-full overflow-hidden shadow-xl"
          >
            <img
              src={logoSrc}
              alt="main logo"
              className="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
          </motion.div>
        </div>
      </Modal>
    </header>
  );
}
