import { useState, type FormEvent, type ChangeEvent } from "react";
import { supabase } from "../../utils/supabase.ts";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [full_name, setFullName] = useState("");
  const [contact_information, setContactInformation] = useState("");
  const [education, setEducation] = useState("");
  const [major_field_of_study, setMajorFieldOfStudy] = useState("");
  const [years_of_experience, setYearsOfExperience] = useState("");
  const [work_experience, setWorkExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [preferred_working_mode, setPreferredWorkingMode] = useState("");
  const [preferred_location, setPreferredLocation] = useState("");

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

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name,
                contact_information,
                education,
                major_field_of_study,
                years_of_experience,
                work_experience,
                skills,
                preferred_working_mode,
                preferred_location
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
      <h2>Sign In</h2>
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
          type="full_name"
          placeholder="Full Name"
          value={full_name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFullName(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input
          className="input"
          type="contact_information"
          placeholder="Contact Information"
          value={contact_information}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setContactInformation(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input
          className="input"
          type="education"
          placeholder="Education"
          value={education}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEducation(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input
          className="input"
          type="major_field_of_study"
          placeholder="Major/Field of Study"
          value={major_field_of_study}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setMajorFieldOfStudy(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input
          className="input"
          type="years_of_experience"
          placeholder="Years of Experience"
          value={years_of_experience}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setYearsOfExperience(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input
          className="input"
          type="work_experience"
          placeholder="Work Experience"
          value={work_experience}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setWorkExperience(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input
          className="input"
          type="skills"
          placeholder="Skills"
          value={skills}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSkills(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input
          className="input"
          type="preferred_working_mode"
          placeholder="Preferred Working Mode (Remote / On-site / Hybrid)"
          value={preferred_working_mode}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPreferredWorkingMode(e.target.value)
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input
          className="input"
          type="preferred_location"
          placeholder="Preferred Location"
          value={preferred_location}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPreferredLocation(e.target.value)
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
    </div>
  );
};
