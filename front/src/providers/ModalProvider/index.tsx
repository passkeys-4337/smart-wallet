"use client";

import React, { useContext, useEffect, useState } from "react";
import { Portal, Box } from "@radix-ui/themes";
import styled from "@emotion/styled";
import { useTheme } from "next-themes";

const PortalContainer = styled(Portal)<{ $isOpen: Boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  @media (min-width: 391px) {
    height: calc(100vh - 4rem);
  }
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
`;

const Modal = styled.div<{ $isOpen: Boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70svh;
  padding: 1rem;
  background-color: var(--color-background);
  border-radius: 10px 10px 0 0;
  transform: ${({ $isOpen }) => ($isOpen ? "translate3d(0, 0, 0)" : "translate3d(0, 100svh, 0)")};
  transition: transform 0.3s ease-in-out;
  z-index: 100;
`;

const Overlay = styled.div<{ $isOpen: Boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  backdrop-filter: blur(4px);
  width: 100%;
  height: 100svh;
  @media (min-width: 391px) {
    height: calc(100vh - 40px);
  }
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s ease-in-out;
  z-index: 99;

  ::before {
    background: var(--gray-8);
    opacity: 0.5;
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100svh;
    @media (min-width: 391px) {
      height: calc(100vh - 40px);
    }
  }
`;

function useModalHook() {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [isOpen, setIsOpen] = useState<Boolean>(false);
  const [isBackdrop, setIsBackdrop] = useState<Boolean>(false);
  const { theme } = useTheme();

  function open(content: React.ReactNode) {
    if (isOpen) {
      setContent(null);
      setIsOpen(false);
      setTimeout(() => {
        setContent(content);
        setIsOpen(true);
      }, 150);
      return;
    }

    setContent(content);
    setIsOpen(true);
    setIsBackdrop(true);
  }

  function close() {
    setContent(null);
    setIsOpen(false);
    setIsBackdrop(false);
  }

  return {
    content,
    isOpen,
    isBackdrop,
    open,
    close,
  };
}

type UseModalHook = ReturnType<typeof useModalHook>;
const ModalContext = React.createContext<UseModalHook | null>(null);

export const useModal = (): UseModalHook => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalHook must be used within a ModalHoolProvider");
  }
  return context;
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const modalValue = useModalHook();
  const [isPortalMounted, setIsPortalMounted] = useState(false);

  useEffect(() => {
    setIsPortalMounted(true);
  }, []);

  let radixElement: HTMLElement | null = null;
  if (isPortalMounted) {
    radixElement = document.getElementsByClassName("radix-themes")[0] as HTMLElement;
  }

  return (
    <ModalContext.Provider value={modalValue}>
      {children}
      {isPortalMounted && radixElement && (
        <PortalContainer $isOpen={modalValue.isOpen} container={radixElement as HTMLElement}>
          <Overlay $isOpen={modalValue.isBackdrop} onClick={() => modalValue.close()} />
          <Modal
            $isOpen={modalValue.isOpen}
            onTouchMove={(e) => {
              e.preventDefault();
            }}
          >
            <Box
              style={{
                width: "40%",
                backgroundColor: "var(--gray-6)",
                height: "8px",
                borderRadius: "10px",
                marginBottom: "1rem",
              }}
              onClick={() => modalValue.close()}
            />
            {modalValue.content}
          </Modal>
        </PortalContainer>
      )}
    </ModalContext.Provider>
  );
}
