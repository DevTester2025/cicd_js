export const WazuhConstant = Object.freeze({
    DASHBOARD_URL: {
        PCIDSS : "/app/dashboards#/view/1c7ed300-10ea-11ef-96cf-8bfc28575c01?embed=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1d,to:now))&show-time-filter=true&hide-filter-bar=true&_a=(description:'',filters:!((query:(match_phrase:(agent.id:'{{agent_id}}')))))",
        GDPR: "/app/dashboards#/view/7b382540-10ef-11ef-96cf-8bfc28575c01?embed=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1d,to:now))&show-time-filter=true&hide-filter-bar=true&_a=(description:'',filters:!((query:(match_phrase:(agent.id:'{{agent_id}}')))))",
        HIPAA: "/app/dashboards#/view/70a59fc0-10f1-11ef-96cf-8bfc28575c01?embed=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1d,to:now))&show-time-filter=true&hide-filter-bar=true&_a=(description:'',filters:!((query:(match_phrase:(agent.id:'{{agent_id}}')))))",
        NIST:"/app/dashboards#/view/807e8e90-10fe-11ef-96cf-8bfc28575c01?embed=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1d,to:now))&show-time-filter=true&hide-filter-bar=true&_a=(description:'',filters:!((query:(match_phrase:(agent.id:'{{agent_id}}')))))",
        SOC2: "/app/dashboards#/view/c8c19d80-10e2-11ef-96cf-8bfc28575c01?embed=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1d,to:now))&show-time-filter=true&hide-filter-bar=true&_a=(description:'',filters:!((query:(match_phrase:(agent.id:'{{agent_id}}')))))",
        INTEGRITY_MONITORING: "/app/dashboards#/view/4d5458a0-10f5-11ef-96cf-8bfc28575c01?embed=true&_g=(filters:!(),query:(language:kuery,query:''),refreshInterval:(pause:!t,value:0),time:(from:now-1d,to:now))&show-time-filter=true&hide-filter-bar=true&_a=(description:'',filters:!((query:(match_phrase:(agent.id:'{{agent_id}}')))))",
    },
    AVAILABLE_RANGE: [3, 7, 10, 30, 90],
    DASHBOARD_KEYNAME: "wazuh-dashboard-url"
});