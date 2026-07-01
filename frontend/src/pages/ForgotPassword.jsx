// import React from 'react';

const ForgotPasswordPage = () => {
  return (
    <div className="flex min-h-screen w-full font-sans antialiased text-zinc-950 bg-white">
      {/* Left Side: Branding / Testimonial (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-950 p-12 text-white lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-2 text-lg font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-zinc-950">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>
          </div>
          PopcornClash
        </div>

        {/* Quote */}
        <div className="max-w-md">
          <blockquote className="space-y-4">
            <p className="text-lg font-light leading-relaxed">
              ""
            </p>
            <footer className="text-sm">
              <cite className="not-italic font-medium">Marcus Chen</cite>
              <p className="text-zinc-400"></p>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side: Forgot Password Form */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-[360px] space-y-8">
          
          {/* Header */}
          <div className="space-y-2 text-center">
            {/* Simple Key Icon for visual cue */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-950"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3-3.5 3.5z"/></svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
            <p className="text-sm text-zinc-500">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <button className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2">
                Send Reset Link
              </button>
            </div>
          </div>

          {/* Back to Login */}
          <p className="text-center text-sm text-zinc-500">
            <a href="#" className="inline-flex items-center gap-2 font-medium text-zinc-950 hover:underline underline-offset-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to login
            </a>
          </p>
          
          <div className="text-center text-[12px] leading-relaxed text-zinc-400">
            If you don't receive an email within a few minutes, please check your spam folder.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;