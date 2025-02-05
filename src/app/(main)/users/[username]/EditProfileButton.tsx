"use client";

import {UserData} from "@/lib/types";
import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import EditProfileDialog from "@/app/(main)/users/[username]/EditProfileDialog";

/**
 * Button for editing user profile.
 * We use uploadthing for uploading an avatar.
 */
interface EditProfileButtonProps {
  user: UserData;
}

export default function EditProfileButton(props: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      {/*Show edit profile dialog on click*/}
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        Edit Profile
      </Button>
      {/*Edit profile dialog itself*/}
      <EditProfileDialog
        user={props.user}
        open={showDialog}
        onOpenChange={setShowDialog}
      ></EditProfileDialog>
    </>
  );
}
