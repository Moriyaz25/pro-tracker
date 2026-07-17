import clsx from "clsx";

export default function Card({ children, className, ...props }) {
  return (
    <div className={clsx("surface-card rounded-2xl p-5 sm:rounded-3xl", className)} {...props}>
      {children}
    </div>
  );
}
