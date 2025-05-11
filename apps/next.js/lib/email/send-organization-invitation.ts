interface SendOrganizationInvitation {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}

const sendOrganizationInvitation = async (data: SendOrganizationInvitation) => {
  const { email, invitedByUsername, invitedByEmail, teamName, inviteLink } =
    data;

  console.log(
    "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
  );
  console.log(`Sending invitation to ${email}`);
  console.log(`Invited by: ${invitedByUsername} (${invitedByEmail})`);
  console.log(`Team: ${teamName}`);
  console.log(`Invite link: ${inviteLink}`);
  console.log(
    "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
  );
};
