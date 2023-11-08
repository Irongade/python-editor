import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StateContext } from "../context";
import uniqueRandom from "unique-random";

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUsername] = useState("");
  const [skill, setSkill] = useState("");
  const [error, setError] = useState("");

  const { setUserId, setSkillLevel } = useContext(StateContext);

  const beginSession = () => {
    setError("");
    if (!userName || !skill) {
      setError("Please answer the questions.");
      return;
    }

    setUserId(userName + uniqueRandom(0, 1000)());
    setSkillLevel(skill);

    navigate("/app");
  };

  return (
    <div>
      <section class="auth-section">
        <form method="post" action="#" onSubmit={(e) => e.preventDefault()}>
          <div class="auth-form-header">
            <div class="form-img-container">
              <img src="Rectangle.gif" alt="Auth gif animation" />
            </div>
            <h4 class="banner__heading heading-4">Take test.</h4>
            {error && <p class="form-header-error">{error}</p>}
          </div>
          <div class="input-container">
            <input
              class="input"
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setUsername(e.target.value)}
            />
            <label class="label_floating" for="email">
              Username
            </label>
          </div>

          <div class="input-container">
            <input
              class="input"
              type="text"
              placeholder="Enter your password"
              onChange={(e) => setSkill(e.target.value)}
            />
            <label class="label_floating" for="password">
              What is your proficiency level?
            </label>
          </div>

          <div class="btn-container max-width center-btn-text">
            <button class="btn btn-primary" onClick={beginSession}>
              <span>Begin</span>
            </button>
          </div>
          {/* <div class="auth-subtext-container">
            <p>
              <a href="forgot-password.php">Forgot password? </a>
            </p>
            <p>
              <a href="register.php">Create new account </a>
            </p>
          </div> */}
        </form>
      </section>
    </div>
  );
};

export default Login;
