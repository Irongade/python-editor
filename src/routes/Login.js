import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StateContext } from "../context";
import uniqueRandom from "unique-random";
import Button from "../components/Button";

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

    localStorage.setItem("userId", userName + uniqueRandom(0, 1000)());
    localStorage.setItem("skillLevel", skill);

    navigate("/app");
  };

  return (
    <div>
      <section className="auth-section">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="auth-form-header">
            <div className="form-img-container">
              <img src="Rectangle.gif" alt="Auth gif animation" />
            </div>
            <h4 className="banner__heading heading-4 heading-4-margin">
              Start Session.
            </h4>
            {error && <p className="form-header-error">{error}</p>}

            <p className="banner__heading heading-text no-margin">
              {`Please input your username and Skill level (Beginner, Intermediate, Advanced)`}
            </p>
          </div>
          <div className="input-container">
            <input
              className="input"
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setUsername(e.target.value)}
            />
            <label className="label_floating" for="email">
              Username
            </label>
          </div>

          <div className="input-container">
            <input
              className="input"
              type="text"
              placeholder="Enter your password"
              onChange={(e) => setSkill(e.target.value)}
            />
            <label className="label_floating" for="password">
              What is your proficiency level?
            </label>
          </div>

          <div className="btn-container max-width center-btn-text">
            <Button type={"primary"} text={"Begin"} onClickFn={beginSession} />
            {/* <button className="btn btn-primary" onClick={beginSession}>
              <span>Begin</span>
            </button> */}
          </div>
          {/* <div className="auth-subtext-container">
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
