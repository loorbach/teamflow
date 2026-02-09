async function editRoleAction() {
  try {
    setTimeout(() => {
      throw new Error('messed up');
    }, 5000);
  } catch (error) {
    console.error(error);
  }
}

export default editRoleAction;
