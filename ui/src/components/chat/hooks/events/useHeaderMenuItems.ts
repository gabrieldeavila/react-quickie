import { useMemo } from "react";
import { FiFolderPlus, FiServer, FiSettings } from "react-icons/fi";
import type { HeaderMenuItem } from "@/features/header-menu/components/HeaderOverflowMenu";
import { getHostFeatures } from "@/host/domain/host-features";
import { getRuntimeConfig } from "@/host/runtime-config";
import { useChatBaseContext } from "../../context/context";
import { useOpenSettings } from "./useOpenSettings";

const HOST_FEATURES = getHostFeatures(getRuntimeConfig().host);

/** Items of the header "⋯" menu: new project (when offered), MCP servers, settings. */
export function useHeaderMenuItems(): HeaderMenuItem[] {
  const { setIsCreateModalOpen, setIsMcpDialogOpen } = useChatBaseContext();
  const openSettings = useOpenSettings();

  return useMemo(() => {
    const settings: HeaderMenuItem = {
      key: "settings",
      label: "Settings",
      icon: FiSettings,
      onSelect: openSettings,
    };
    const mcp: HeaderMenuItem = {
      key: "mcp",
      label: "MCP servers",
      icon: FiServer,
      onSelect: () => setIsMcpDialogOpen(true),
    };
    if (!HOST_FEATURES.canCreateProjects) return [mcp, settings];

    const newProject: HeaderMenuItem = {
      key: "new-project",
      label: "New project",
      icon: FiFolderPlus,
      onSelect: () => setIsCreateModalOpen(true),
    };
    return [newProject, mcp, settings];
  }, [openSettings, setIsCreateModalOpen, setIsMcpDialogOpen]);
}
