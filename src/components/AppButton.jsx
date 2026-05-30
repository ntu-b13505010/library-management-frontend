function AppButton({ children, variant = 'primary', type = 'button', ...props }) {
  return (
    <button className={`app-button app-button--${variant}`} type={type} {...props}>
      {children}
    </button>
  );
}

export default AppButton;
