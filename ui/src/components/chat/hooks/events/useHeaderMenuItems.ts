import { useMemo } from "react";
import { FiFolderPlus, FiSettings } from "react-icons/fi";
import type { HeaderMenuItem } from "@/features/header-menu/components/HeaderOverflowMenu";
import { newProjectLabel } from "@/features/header-menu/domain/new-project-label";
import { getHostFeatures } from "@/host/domain/host-features";
import { getRuntimeConfig } from "@/host/runtime-config";
import { useChatBaseContext } from "../../context/context";
import { useOpenSettings } from "./useOpenSettings";

const HOST_FEATURES = getHostFeatures(getRuntimeConfig().host);

/** Items of the header "⋯" menu: new project (when offered) and settings. */
export function useHeaderMenuItems(): HeaderMenuItem[] {
  const { projectContext, setIsCreateModalOpen } = useChatBaseContext();
  const openSettings = useOpenSettings();

  return useMemo(() => {
    const projectLabel = newProjectLabel(projectContext.focus, HOST_FEATURES);
    const settings: HeaderMenuItem = {
      key: "settings",
      label: "Settings",
      icon: FiSettings,
      onSelect: openSettings,
    };
    if (!projectLabel) return [settings];

    const newProject: HeaderMenuItem = {
      key: "new-project",
      label: projectLabel,
      icon: FiFolderPlus,
      onSelect: () => setIsCreateModalOpen(true),
    };
    return [newProject, settings];
  }, [projectContext.focus, openSettings, setIsCreateModalOpen]);
}
