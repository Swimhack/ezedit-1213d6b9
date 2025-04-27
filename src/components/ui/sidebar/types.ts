
import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { VariantProps } from "class-variance-authority"
import { sheetVariants } from "./sheet-variants"

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  children?: React.ReactNode;
}

export interface SidebarContext {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  toggleSidebar: () => void
}
