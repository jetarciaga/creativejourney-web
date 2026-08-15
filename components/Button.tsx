import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "quiet";

type ButtonBaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type ButtonA11yProps =
  | { iconOnly: true; "aria-label": string }
  | { iconOnly?: false; "aria-label"?: string };

type LinkButtonProps = ButtonBaseProps &
  ButtonA11yProps & {
    href: string;
    target?: string;
    rel?: string;
  };

type NativeButtonProps = ButtonBaseProps &
  ButtonA11yProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: never;
  };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

function isLinkButton(props: ButtonProps): props is LinkButtonProps {
  return "href" in props && props.href !== undefined;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-fill !text-white shadow-sm hover:bg-green-700 hover:shadow-site",
  secondary:
    "border border-border-strong bg-transparent text-text hover:border-accent hover:text-accent",
  quiet: "text-link underline decoration-transparent hover:text-accent hover:decoration-current",
};

export const buttonClasses = (
  variant: ButtonVariant = "primary",
  className?: string,
) =>
  cn(
    "inline-flex min-h-[var(--site-tap-min)] items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition duration-200 ease-out motion-reduce:transition-none",
    variantClasses[variant],
    className,
  );

export default function Button(props: ButtonProps) {
  const { children, variant = "primary", className, iconOnly } = props;
  const classes = buttonClasses(variant, cn(iconOnly && "w-[var(--site-tap-min)] px-0", className));

  if (isLinkButton(props)) {
    const { href, target, rel, "aria-label": ariaLabel } = props;

    return (
      <Link
        className={classes}
        href={href}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  const { type = "button", "aria-label": ariaLabel, ...buttonProps } = props;
  return (
    <button className={classes} {...buttonProps} aria-label={ariaLabel} type={type}>
      {children}
    </button>
  );
}
