"use client";

import React, { useContext, useEffect, useState } from "react";
import { Portal } from "@radix-ui/themes";
import styled from "@emotion/styled";

const PortalContainer = styled(Portal)<{ isOpen: Boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  @media (min-width: 391px) {
    height: calc(100vh - 40px);
  }
  pointer-events: ${({ isOpen }) => (isOpen ? "auto" : "none")};
`;

const Modal = styled.div<{ isOpen: Boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80svh;
  border: 5px solid var(--accent-9);
  border-radius: 10px 10px 0 0;
  background-color: white;
  transform: ${({ isOpen }) => (isOpen ? "translate3d(0, 0, 0)" : "translate3d(0, 100svh, 0)")};
  transition: transform 0.1s ease-in-out;
  color: black;
`;

const Overlay = styled.div<{ isOpen: Boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  backdrop-filter: blur(3px);
  // background-color: rgba(var(--color-selection-root), 0.5);
  width: 100%;
  height: 100svh;
  @media (min-width: 391px) {
    height: calc(100vh - 40px);
  }
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: opacity 0.1s ease-in-out;
`;

function useModalHook() {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [isOpen, setIsOpen] = useState<Boolean>(false);
  const [isBackdrop, setIsBackdrop] = useState<Boolean>(false);

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

  const radixElement = document.getElementsByClassName("radix-themes")[0];
  return (
    <ModalContext.Provider value={modalValue}>
      {children}
      {isPortalMounted && (
        <PortalContainer isOpen={modalValue.isOpen} container={radixElement as HTMLElement}>
          <Overlay isOpen={modalValue.isBackdrop} onClick={() => modalValue.close()} />
          <Modal isOpen={modalValue.isOpen}>{modalValue.content}</Modal>
        </PortalContainer>
      )}
    </ModalContext.Provider>
  );
}
