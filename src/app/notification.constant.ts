import { environment } from "../environments/environment";

export const NotificationConstant = Object.freeze({
  Email: {
    Users: {
      Created: `Hi {{to_user_name}},\n\n \t New user "{{user_name}}" has been created by "{{created_by}}" on "{{created_dt}}" \n \t For more details visit ${environment.weburl}/users.\n\nThanks and Regards,\nESKO`,
      "Role Change": `Hi {{to_user_name}},\n\n \t The Role was updated for user "{{user_name}}" by "{{updated_by}}" on "{{updated_dt}}" \n \t For more details visit ${environment.weburl}/users.\n\nThanks and Regards,\nESKO`,
      Deleted: `Hi {{to_user_name}},\n\n \t The user "{{user_name}}" has been deleted by "{{deleted_by}}" on "{{deleted_dt}}" \n \t For more details visit ${environment.weburl}/users.\n\nThanks and Regards,\nESKO`,
    },
    Role: {
      Created: `Hi {{to_user_name}},\n\n \t New Role "{{role_name}}" has been created by "{{created_by}}" on "{{created_dt}}" \n \t For more details visit ${environment.weburl}/roles/{{roleid}}.\n\nThanks and Regards,\nESKO`,
      Edited: `Hi {{to_user_name}},\n\n \t The Role "{{role_name}}" details were updated by "{{updated_by}}" on "{{updated_dt}}" \n \t For more details visit ${environment.weburl}/roles/{{roleid}}.\n\nThanks and Regards,\nESKO`,
      Deleted: `Hi {{to_user_name}},\n\n \t The Role "{{role_name}}" was deleted by "{{deleted_by}}" on "{{deleted_dt}}" \n \t For more details visit ${environment.weburl}/roles.\n\nThanks and Regards,\nESKO`,
    },
    Deployment: {
      Success: `Hi {{to_user_name}},↵↵ 	 The template "{{template_name}}" has been deployed successfully by "{{deployed_by}}" on "{{deployed_dt}}".↵↵             Cloud Provider : "{{cloud_provider}}"↵             Region              : "{{region}}" \n \t For more details visit ${environment.weburl}/server/list.↵↵Thanks and Regards,↵ESKO`,
      Failed: `Hi {{to_user_name}},↵↵ 	 The template "{{template_name}}" deployed by "{{deployed_by}}" was failed on "{{deployed_dt}}".↵↵             Cloud Provider : "{{cloud_provider}}"↵             Region              : "{{region}}" \n \t For more details visit ${environment.weburl}/server/list.↵↵Thanks and Regards,↵ESKO`,
    },
    Asset: {
      Resize: `Hi {{to_user_name}},\n\n \t The instance "{{instance_name}}" was resized to "{{changed_config}}" on "{{updated_dt}}" \n \t For more details visit ${environment.weburl}/assets.\n\nThanks and Regards,\nESKO`,
      // "Resize": `Hi {{to_user_name}},\n\n \t The instance "{{instance_name}}" was resized to "{{changed_config}}" on "{{updated_dt}}".\n\nThanks and Regards,\nESKO`,
      "Data Collection Failure": `Hi {{to_user_name}},\n\n \t The data collectoin from instance "{{instance_name}}" was failed on "{{failed_dt}}" \n \t For more details visit ${environment.weburl}/assets.\n\nThanks and Regards,\nESKO`,
      New: `A New VM has been created "{{id}}"`,
      Modified: `A VM has been modified "{{id}}"`,
      Deleted: `A VM has been removed "{{id}}"`,
    },
    Template: {
      Created: `Hi {{to_user_name}},\n\n \t New template "{{template_name}}" has been created by "{{created_by}}" on "{{created_dt}}" \n \t For more details visit ${environment.weburl}/solutiontemplate/edit/{{templateid}}.\n\nThanks and Regards,\nESKO`,
      Edited: `Hi {{to_user_name}},\n\n \t The template "{{template_name}}" was updated by "{{updated_by}}" on "{{updated_dt}}" \n \t For more details visit ${environment.weburl}/solutiontemplate/edit/{{templateid}}.\n\nThanks and Regards,\nESKO`,
      Deleted: `Hi {{to_user_name}},\n\n \t The template "{{template_name}}" was deleted by "{{deleted_by}}" on "{{deleted_dt}}" \n \t For more details visit ${environment.weburl}/solutiontemplate.\n\nThanks and Regards,\nESKO`,
    },
    Catalog: {
      Published: `Hi {{to_user_name}},\n\n \t The catalog "{{catalog_name}}" was published by "{{published_by}}" on "{{published_dt}}" \n \t For more details visit ${environment.weburl}/srm/catalog/view?id={{catelogid}}&mode=View.\n\nThanks and Regards,\nESKO`,
      Unpublished: `Hi {{to_user_name}},\n\n \t The catalog "{{catalog_name}}" was unpublished by "{{unpublished_by}}" on "{{unpublished_dt}}" \n \t For more details visit ${environment.weburl}/srm/catalog/view?id={{catelogid}}&mode=View.\n\nThanks and Regards,\nESKO`,
      Changed: `Hi {{to_user_name}},\n\n \t The catalog "{{catalog_name}}" was changed by "{{changed_by}}" on "{{changed_dt}}" \n \t For more details visit ${environment.weburl}/srm/list.\n\nThanks and Regards,\nESKO`,
    },
    "Service Request": {
      Created: `Hi {{to_user_name}},\n\n \t New Service request "{{sr_name}}" has been created by "{{created_by}}" on "{{created_dt}}" \n \t For more details visit ${environment.weburl}/srm.\n\nThanks and Regards,\nESKO`,
      Approved: `Hi {{to_user_name}},\n\n \t The Service request "{{sr_name}}" was approved by "{{approved_by}}" on "{{approved_dt}}" \n \t For more details visit ${environment.weburl}/srm.\n\nThanks and Regards,\nESKO`,
      Rejected: `Hi {{to_user_name}},\n\n \t The Service request "{{sr_name}}" was rejected by "{{rejected_by}}" on "{{rejected_dt}}" \n \t For more details visit ${environment.weburl}/srm.\n\nThanks and Regards,\nESKO`,
    },
    Budget: {
      "Over Run": `Hi {{to_user_name}},\n\n \t The Billing amount {{billing_amount}} overrun the budget "{{budget_amount}}" for the month "{{month}}". \n \t For more details visit ${environment.weburl}/budget.\n\nThanks and Regards,\nESKO`,
    },
  },
  SMS: {
    Users: {
      Created: `New user "{{user_name}}" has been created by "{{created_by}}" on "{{created_dt}}". For more details visit ${environment.weburl}/users.`,
      "Role Change": `The Role was updated for user "{{user_name}}" by "{{updated_by}}" on "{{updated_dt}}". For more details visit ${environment.weburl}/users.`,
      Deleted: `The user "{{user_name}}" has been deleted by "{{deleted_by}}" on "{{deleted_dt}}". For more details visit ${environment.weburl}/users.`,
    },
    Role: {
      Created: `New Role "{{role_name}}" has been created by "{{created_by}}" on "{{created_dt}}". For more details visit ${environment.weburl}/roles/{{roleid}}.`,
      Edited: `The Role "{{role_name}}" details were updated by "{{updated_by}}" on "{{updated_dt}}". For more details visit ${environment.weburl}/roles/{{roleid}}.`,
      Deleted: `The Role "{{role_name}}" was deleted by "{{deleted_by}}" on "{{deleted_dt}}". For more details visit ${environment.weburl}/roles.`,
    },
    Deployment: {
      Success: `The template "{{template_name}}" has been deployed successfully by "{{deployed_by}}" on "{{deployed_dt}}". For more details visit ${environment.weburl}/server/list.`,
      Failed: `The template "{{template_name}}" deployed by "{{deployed_by}}" was failed on "{{deployed_dt}}". For more details visit ${environment.weburl}server/list.`,
    },
    Asset: {
      Resize: `The instance "{{instance_name}}" was resized to "{{changed_config}}" on "{{updated_dt}}". For more details visit ${environment.weburl}/assets.`,
      // "Resize": `The instance "{{instance_name}}" was resized to "{{changed_config}}" on "{{updated_dt}}".`,
      "Data Collection Failure": `The data collectoin from instance "{{instance_name}}" was failed on "{{failed_dt}}". For more details visit ${environment.weburl}/assets.`,
    },
    Template: {
      Created: `New template "{{template_name}}" has been created by "{{created_by}}" on "{{created_dt}}". For more details visit ${environment.weburl}/solutiontemplate/edit/{{templateid}}.`,
      Edited: `The template "{{template_name}}" was updated by "{{updated_by}}" on "{{updated_dt}}". For more details visit ${environment.weburl}/solutiontemplate/edit/{{templateid}}.`,
      Deleted: `The template "{{template_name}}" was deleted by "{{deleted_by}}" on "{{deleted_dt}}". For more details visit ${environment.weburl}/solutiontemplate.`,
    },
    Catalog: {
      Published: `The catalog "{{catalog_name}}" was published by "{{published_by}}" on "{{published_dt}}". For more details visit ${environment.weburl}/srm/catalog/view?id={{catelogid}}&mode=View.`,
      Unpublished: `The catalog "{{catalog_name}}" was unpublished by "{{unpublished_by}}" on "{{unpublished_dt}}". For more details visit ${environment.weburl}/srm/catalog/view?id={{catelogid}}&mode=View.`,
      Changed: `The catalog "{{catalog_name}}" was changed by "{{changed_by}}" on "{{changed_dt}}". For more details visit ${environment.weburl}/srm/list.`,
    },
    "Service Request": {
      Created: `New Service request "{{sr_name}}" has been created by "{{created_by}}" on "{{created_dt}}". For more details visit ${environment.weburl}/srm.`,
      Approved: `The Service request "{{sr_name}}" was approved by "{{approved_by}}" on "{{approved_dt}}". For more details visit ${environment.weburl}/srm.`,
      Rejected: `The Service request "{{sr_name}}" was rejected by "{{rejected_by}}" on "{{rejected_dt}}". For more details visit ${environment.weburl}/srm.`,
    },
    Budget: {
      "Over Run": `The Billing amount {{billing_amount}} overrun the budget "{{budget_amount}}" for the month "{{month}}". For more details visit ${environment.weburl}/budget.`,
    },
  },
});
