import React from "react";

const End = () => {
  return (
    <div>
      <section className="auth-section">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="auth-form-header">
            <div className="form-img-container">
              <img src="Rectangle.gif" alt="Auth gif animation" />
            </div>
            <h4 className="banner__heading heading-green heading-4">
              Session Ended.
            </h4>
            <h5 className="banner__heading heading-5">
              Thanks for participating.
            </h5>

            <p className="banner__heading heading-text">
              Please fill the google form link below to talk about your
              experience{" "}
            </p>
          </div>
          <div className="auth-subtext-container">
            <p>{/* <a href="register.php">Create new account </a> */}</p>
            <p>
              <a href="/">Go back home </a>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
};

export default End;
