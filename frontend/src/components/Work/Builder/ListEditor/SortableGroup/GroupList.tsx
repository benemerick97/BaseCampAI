// components/Work/Builder/ListEditor/GroupList.tsx

import type { Step, StepGroup, InputField } from "../../sharedTypes";
import GroupView from "./GroupView";

interface GroupListProps {
  groups: StepGroup[];
  steps: Step[];
  expandedStepId: string | null;
  onExpand: (stepId: string | null) => void;
  menuOpenStepId: string | null;
  toggleMenu: (stepId: string) => void;
  handleDuplicate: (stepId: string) => void;
  handleDelete: (stepId: string) => void;
  onChangeLabel: (stepId: string, newLabel: string) => void;
  onChangeInstructions: (stepId: string, newInstructions: string) => void;
  onChangeInputFields: (stepId: string, newFields: InputField[]) => void;
  onDuplicateGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddStepToGroup: (groupId: string) => void;
  onChangeGroupLabel: (groupId: string, newLabel: string) => void;
}

export default function GroupList({
  groups,
  steps,
  expandedStepId,
  onExpand,
  menuOpenStepId,
  toggleMenu,
  handleDuplicate,
  handleDelete,
  onChangeLabel,
  onChangeInstructions,
  onChangeInputFields,
  onDuplicateGroup,
  onDeleteGroup,
  onAddStepToGroup,
  onChangeGroupLabel,
}: GroupListProps) {
  return (
    <>
      {groups.map((group) => {
        const groupSteps = steps
          .filter((step) => step.groupId === group.id)
          .map((step) => ({
            ...step,
            id: `step-${step.id}`, // Prefix step ID
          }));

        return (
          <GroupView
            key={`group-${group.id}`}
            group={{ ...group, id: `group-${group.id}` }}
            steps={groupSteps}
            expandedStepId={expandedStepId ? `step-${expandedStepId}` : null}
            handleExpand={(id) => {
              const rawId = id.replace(/^step-/, "");
              onExpand(expandedStepId === rawId ? null : rawId);
            }}
            handleDuplicate={(id) => handleDuplicate(id.replace(/^step-/, ""))}
            handleDelete={(id) => handleDelete(id.replace(/^step-/, ""))}
            toggleMenu={(id) => toggleMenu(id.replace(/^step-/, ""))}
            menuOpenStepId={menuOpenStepId ? `step-${menuOpenStepId}` : null}
            onChangeLabel={(id, val) => onChangeLabel(id.replace(/^step-/, ""), val)}
            onChangeInstructions={(id, val) =>
              onChangeInstructions(id.replace(/^step-/, ""), val)
            }
            onChangeInputFields={(id, fields) =>
              onChangeInputFields(id.replace(/^step-/, ""), fields)
            }
            onDuplicateGroup={(id) => onDuplicateGroup(id.replace(/^group-/, ""))}
            onDeleteGroup={(id) => onDeleteGroup(id.replace(/^group-/, ""))}
            onAddStepToGroup={(id) => onAddStepToGroup(id.replace(/^group-/, ""))}
            onChangeGroupLabel={(id, label) =>
              onChangeGroupLabel(id.replace(/^group-/, ""), label)
            }
          />
        );
      })}
    </>
  );
}
