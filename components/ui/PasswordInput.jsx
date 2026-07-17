"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineLockClosed } from "react-icons/hi2";

export default function PasswordInput({ label = "Password", error, className, ...props }) {
  const generatedId = useId();
  const id = props.id || generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="block">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <HiOutlineLockClosed
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={19}
        />
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          className={clsx(
            "field-control has-leading-icon has-trailing-icon",
            error && "border-rose-400 ring-2 ring-rose-100",
            className
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <HiOutlineEyeSlash size={20} /> : <HiOutlineEye size={20} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
