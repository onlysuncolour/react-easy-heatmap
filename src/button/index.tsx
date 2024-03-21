import React, { FC, ReactNode } from "react"

type Props = {
  disabled?: boolean
  onClick?: () => void
  children: ReactNode;
}
const Button:FC<Props> = ({
  disabled,
  onClick,
  children
}) => {
  return <button
  disabled={disabled}
  onClick={onClick}
  >{children}</button>
}

export default Button