import { useState, FormEvent, ChangeEvent } from "react";
import { supabase } from "../../utils/supabase.ts";

export const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        console.error("Error signing up:", signInError.message);
        return;
      }
  };

    const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                fullName
            }
        },

      });
      if (signUpError) {
        console.error("Error signing up:", signUpError.message);
        return;
      }

  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "1rem" }}>
      <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
        <form onSubmit={handleSubmit}>
            <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                }
                style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
            />
            <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                }
                style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
            />
            <button
                className="button"
                type="submit"
                style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
            >
                Sign In
            </button>

        </form>

        <h2>Sign Up</h2>
        <form onSubmit={handleSignUp}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input
          className="input"
          type="name"
          placeholder="Full Name"
          value={fullName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFullName(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <button
          className="button"
          type="submit"
          style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
        >
          Sign Up
        </button>

        </form>

        {/* {isSignUp  ? (
            <div>
                <input type="radio" id="candidate" name="user_type" value="Candidate" />
                <label htmlFor="candidate">Candidate</label>
                <input type="radio" id="employer" name="user_type" value="Employer" />
                <label htmlFor="employer">Employer</label>
                <br />
            </div>
        ) : (<></>) } */}

        

        

{/* old version of form. changing button from sign-in to sign-up*/}
      {/* <button
        onClick={() => {
          setIsSignUp(!isSignUp);
        }}
        className="button"
        style={{ padding: "0.5rem 1rem" }}
      >
        {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
      </button> */}
    </div>
  );
};
