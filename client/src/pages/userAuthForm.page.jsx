import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import InputBox from "../components/input";
import AnimationWrapper from "../common/page-animation";
import { useContext, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const userAuthThroughServer = async (serverRoute, formData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/auth/${serverRoute}`,
        formData
      );
      storeInSession("user", JSON.stringify(response?.data));
      setUserAuth(response.data);
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.error || "Something went wrong. Please try again."
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const serverRoute = type === "sign-in" ? "signin" : "signup";

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    const { fullname, email, password } = formData;

    if (type !== "sign-in" && fullname.length < 3) {
      return toast.error("Fullname must be at least 3 letters long");
    }

    if (!email.length) return toast.error("Email is required!");
    if (!emailRegex.test(email)) return toast.error("Email is invalid");

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password should be 6 to 20 characters long with a number, lowercase and uppercase letter"
      );
    }

    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();

    authWithGoogle()
      .then((user) => {
        let serveRoute = "google-auth";
        let formData = {
          access_token: user.accessToken,
        };
        userAuthThroughServer(serveRoute, formData);
      })
      .catch((err) => {
        toast.error("Trouble login though google");
        return console.log(err);
      });
  };

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form onSubmit={handleSubmit} className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "sign-in" ? "Welcome back" : "Join us today"}
          </h1>

          {type !== "sign-in" && (
            <InputBox
              id="fullname"
              name="fullname"
              type="text"
              placeholder="Enter Full Name"
              value={formData.fullname}
              onChange={handleChange}
              icon="fi-rr-user"
            />
          )}

          <InputBox
            id="email"
            name="email"
            type="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            icon="fi-rr-envelope"
          />

          <InputBox
            id="password"
            name="password"
            type="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            icon="fi-rr-key"
          />

          <button type="submit" className="btn-dark center mt-14">
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button
            onClick={handleGoogleAuth}
            className="btn-dark flex items-center justify-center gap-4 w-[90%] mx-auto"
          >
            <img src={googleIcon} className="w-5" />
            continue with google
          </button>

          {type === "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today.
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here.
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
