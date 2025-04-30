
import { useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseFileLoadEffectProps {
  isOpen: boolean;
  connectionId: string;
  filePath: string;
  loadFile: () => Promise<string | undefined>;
  forceRefresh: number;
  setEditorMode: (mode: 'code' | 'wysiwyg') => void;
}

export function useFileLoadEffect({
  isOpen,
  connectionId,
  filePath,
  loadFile,
  forceRefresh,
  setEditorMode
}: UseFileLoadEffectProps) {
  // Use a callback for loading file to prevent dependency issues
  const fetchFileContent = useCallback(async () => {
    if (isOpen && connectionId && filePath) {
      console.log(`[FileEditorModal] Loading file: ${filePath}, connectionId: ${connectionId}`);
      try {
        const content = await loadFile();
        console.log(`[FileEditorModal] File loaded successfully, length: ${content?.length || 0}`);
        
        // Detect if this is an HTML file and set editor mode appropriately
        if (content && /\.(html?|htm|php)$/i.test(filePath)) {
          // Check for HTML content signatures
          if (/<!DOCTYPE html|<html|<body|<head|<div|<p|<script|<style/i.test(content)) {
            console.log('[FileEditorModal] HTML content detected, switching to WYSIWYG mode');
            setEditorMode('wysiwyg');
          }
        }
      } catch (err) {
        console.error(`[FileEditorModal] Failed to load file: ${filePath}`, err);
        toast.error(`Failed to load file: ${err.message || "Unknown error"}`);
      }
    }
  }, [isOpen, connectionId, filePath, loadFile, setEditorMode]);

  // Load file when modal opens or when connection/path/forceRefresh change
  useEffect(() => {
    if (isOpen) {
      console.log(`[FileEditorModal] Modal opened, triggering file load for ${filePath}`);
      fetchFileContent();
    } else {
      console.log('[FileEditorModal] Modal closed');
    }
  }, [fetchFileContent, isOpen, forceRefresh]);

  return { fetchFileContent };
}
