import { useState } from "react";

type RemoveTrackedItemButtonProps = {
  removing: boolean;
  onRemove: () => Promise<boolean>;
  label?: string;
};

export function RemoveTrackedItemButton({ removing, onRemove, label = "Remove from active plan" }: RemoveTrackedItemButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return <button className="button button-quiet remove-tracked-item" type="button" disabled={removing} onClick={() => setConfirming(true)}>{label}</button>;
  }

  return <div className="confirm-remove-actions" role="group" aria-label="Confirm removal">
    <button className="button button-danger" type="button" disabled={removing} onClick={async () => {
      if (await onRemove()) setConfirming(false);
    }}>{removing ? "Removing…" : "Confirm removal"}</button>
    <button className="button button-quiet" type="button" disabled={removing} onClick={() => setConfirming(false)}>Keep item</button>
  </div>;
}

type TrackedIssueActionProps = {
  matched: boolean;
  added: boolean;
  saving: boolean;
  removing: boolean;
  onAdd: () => Promise<void>;
  onRemove: () => Promise<boolean>;
};

export function TrackedIssueAction({ matched, added, saving, removing, onAdd, onRemove }: TrackedIssueActionProps) {
  return <div className="issue-maintenance-action">
    <div><span>My Garage work list</span><p>{added ? "This issue is being tracked for the selected vehicle. Removing it leaves completed service records untouched." : matched ? "Add this issue to the selected vehicle, then record the repair when it is completed." : "Select a matching vehicle before adding this issue."}</p></div>
    {added
      ? <RemoveTrackedItemButton removing={removing} onRemove={onRemove} label="Remove tracked issue" />
      : <button className="button button-primary" type="button" disabled={!matched || saving} onClick={() => void onAdd()}>{saving ? "Adding…" : "Add to maintenance"}</button>}
  </div>;
}
