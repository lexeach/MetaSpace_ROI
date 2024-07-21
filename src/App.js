// src/App.js

import React from "react";
import "./App.css";
import Footer from "./components/Footer.js";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    // <div className="App">
    <div>
      {/* <header className="App-header">

      </header> */}

      {/* <main className="App-main">
        <SwiperSlider />
      </main> */}
      <Dashboard />

      <Footer />
    </div>
  );
}

export default App;
