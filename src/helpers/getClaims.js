export default async function getClaims(type) {
  if (type === "resetregion") {
    return fetch(`/api/getresetregions`)
      .then(function (response) {
        if (response) {
          return response.json();
        } else {
          return [];
        }
      })
      .then(function (data) {
        return data;
      });
  }

  return fetch(`/api/getadvclaims?type=${type}`)
    .then(function (response) {
      if (response) {
        return response.json();
      } else {
        return [];
      }
    })
    .then(function (data) {
      const response = [];
      for (const claim of data) {
        if (isClaimOfTheTypeRequested(claim, type)) {
          response.push(claim)
        }
      }
      return response;
    });
}

// API does a very simple string comparison
// and doesn't actually filter on type
// This check is needed to prevent duplicate claims showing up
// Eg if someone creates a notify claim with the word 'reset' in it,
// that claim would show up if type==="reset" AND type==="notify"
function isClaimOfTheTypeRequested(claim, typeRequested) {
  // This should get most claim types
  if (claim.Type.startsWith(typeRequested)) {
    return true
  }

  // Normal claims don't have a type
  if (typeRequested === 'normal' && claim.Type === '') {
    return true
  }
  return false;
}