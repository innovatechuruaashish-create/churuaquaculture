import { useState } from "react";

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const language =
    localStorage.getItem("language") || "en";

  const hi = language === "hi";

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://backend-of-fisheries.onrender.com/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login Failed"
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "admin",
        JSON.stringify(data.admin)
      );

      localStorage.setItem(
        "isAdmin",
        "true"
      );

      onLogin(data.admin);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-gate reveal">
      <div>
        <p className="eyebrow">
          {hi
            ? "एडमिन प्रवेश"
            : "Admin Access"}
        </p>

        <h1>
          {hi
            ? "अधिकारी डैशबोर्ड सुरक्षित है।"
            : "Officer Dashboard is Protected."}
        </h1>

        <p>
          {hi
            ? "आवेदन, दस्तावेज़ और अनुमोदन केवल अधिकृत अधिकारियों के लिए उपलब्ध हैं।"
            : "Applications, documents and approval workflows are available only to authorized officers."}
        </p>
      </div>

      <form
        className="login-card"
        onSubmit={handleSubmit}
      >
        <h2>
          {hi
            ? "एडमिन लॉगिन"
            : "Admin Login"}
        </h2>

        <label>
          {hi
            ? "ईमेल पता"
            : "Email Address"}

          <input
            type="email"
            placeholder="admin@fisheries.com"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          {hi
            ? "पासवर्ड"
            : "Password"}

          <input
            type="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
          />
        </label>

        {error && (
          <p className="form-message error">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="primary-btn"
          disabled={loading}
        >
          {loading
            ? hi
              ? "लॉगिन हो रहा है..."
              : "Logging In..."
            : hi
            ? "डैशबोर्ड में लॉगिन करें"
            : "Login to Dashboard"}
        </button>
      </form>
    </section>
  );
}

export default AdminLogin;
