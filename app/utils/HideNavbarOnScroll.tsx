import React, { useEffect, useState, ReactNode } from "react";

interface HideNavbarOnScrollProps {
  children: ReactNode;
}

const HideNavbarOnScroll: React.FC<HideNavbarOnScrollProps> = ({
  children,
}) => {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const navbar = document.querySelector("nav"); // Assuming you have a <nav> element for your navbar
    if (scrollY > 50) {
      navbar!.style.transform = "translateY(-100%)";
    } else {
      navbar!.style.transform = "translateY(0)";
    }
  }, [scrollY]);

  return <>{children}</>;
};

export default HideNavbarOnScroll;
