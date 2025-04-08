module.exports = function validatePayload(payload) {
    if (!payload.org_name || !payload.assignment_start_date || !payload.assignment_end_date) {
      return { success: false, message: 'Missing required fields: org_name or assignment dates' };
    }
    return { success: true };
  };
  