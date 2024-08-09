// src/Footer.js

import React from "react";
// import "./Footer.css";

const Footer = () => (
  <footer className="bg-dashboard text-light py-4 mt-4">
    <div className="container">
      <div className="row">
        <div className="col-md-4">
          <h5>About Us</h5>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div className="col-md-4">
          <h5>Quick Links</h5>
          <ul className="list-unstyled">
            <li>
              <a
                href="https://scan.KBCfoundation.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Swap MSC
              </a>
            </li>
            {/* <li>
              <a href="https://scan.KBCfoundation.com/">DEX</a>
            </li>
            <li>
              <a href="#">Bridge</a>
            </li> */}
          </ul>
        </div>
        <div className="col-md-4">
          <h5>Contact Us</h5>
          <a href="https:telegram.com">Telegram</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
