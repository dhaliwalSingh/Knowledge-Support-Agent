public with sharing class AgentForceAgentCaller {
    @AuraEnabled
    // Change return type to Map<String, String> to return both response and session ID
    public static Map<String, String> invokeKnowledgeSupportAgent(String userQuestion, String sessionId) {
        Map<String, String> resultMap = new Map<String, String>();
        try {
            Invocable.Action action = Invocable.Action.createCustomAction('generateAiAgentResponse', 'Knowledge_Support_Agent');
            action.setInvocationParameter('userMessage', userQuestion);

            // ONLY set sessionId if it's provided by the LWC 
            if (sessionId != null && !String.isEmpty(sessionId)) {
                action.setInvocationParameter('sessionId', sessionId);
                System.debug('Passing existing SessionId to agent: ' + sessionId);
            } else {
                System.debug('First call or null sessionId, letting agent generate new session.');
            }

            List<Invocable.Action.Result> results = action.invoke();
            Invocable.Action.Result result = results[0];

            if (result.isSuccess()) {
                String agentResponse = (String) result.getOutputParameters().get('agentResponse');
                String botGeneratedSessionId = (String) result.getOutputParameters().get('sessionId'); // Assuming 'sessionId' is the key the bot returns

                resultMap.put('agentResponse', agentResponse);
                // Always return the bot's generated sessionId (even if null for first response, it should be there)
                resultMap.put('sessionId', botGeneratedSessionId);

                System.debug('Agent Response: ' + agentResponse);
                System.debug('Bot Generated/Managed Session ID: ' + botGeneratedSessionId);
                System.debug('Full Agent Output Parameters: ' + result.getOutputParameters());
            } else {
                resultMap.put('agentResponse', 'Agent failed to answer. Please try again.' + result.getErrors());
                System.debug('Java action execution failed: ' + result.getErrors());
            }
        } catch (Exception e) {
            resultMap.put('agentResponse', 'Error invoking Java action: ' + e.getMessage());
            System.debug('Error invoking Java action: ' + e.getMessage());
        }
        return resultMap;
    }
}