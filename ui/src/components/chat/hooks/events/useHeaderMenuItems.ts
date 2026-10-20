import { useMemo } from "react";
import { FiFolderPlus, FiSettings } from "react-icons/fi";
import type { HeaderMenuItem } from "@/features/header-menu/components/HeaderOverflowMenu";
import { getHostFeatures } from "@/host/domain/host-features";
import { getRuntimeConfig } from "@/host/runtime-config";
import { useChatBaseContext } from "../../context/context";
import { useOpenSettings } from "./useOpenSettings";

const HOST_FEATURES = getHostFeatures(getRuntimeConfig().host);

/** Items of the header "⋯" menu: new project (when offered) and settings. */
export function useHeaderMenuItems(): HeaderMenuItem[] {
  const { setIsCreateModalOpen } = useChatBaseContext();
  const openSettings = useOpenSettings();

  return useMemo(() => {
    const settings: HeaderMenuItem = {
      key: "settings",
      label: "Settings",
      icon: FiSettings,
      onSelect: openSettings,
    };
    if (!HOST_FEATURES.canCreateProjects) return [settings];

    const newProject: HeaderMenuItem = {
      key: "new-project",
      label: "New project",
      icon: FiFolderPlus,
      onSelect: () => setIsCreateModalOpen(true),
    };
    return [newProject, settings];
  }, [openSettings, setIsCreateModalOpen]);
}
