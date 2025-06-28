public class KnowledgeRetriever {
    public class Request {
        @InvocableVariable public String question;
    }

    public class Response {
        @InvocableVariable public String context;
    }

    @InvocableMethod(label='Retrieve Knowledge Articles' description='Returns relevant Knowledge article titles')
    public static List<Response> retrieve(List<Request> requests) {
        List<Response> responses = new List<Response>();

        for (Request req : requests) {
            String question = req.question;
            List<String> lines = new List<String>();

            List<List<SObject>> results = [
                FIND :question IN ALL FIELDS
                RETURNING Knowledge__kav(Id, Title, Article_Body__c)
                LIMIT 3
            ];

            List<Knowledge__kav> articles = (List<Knowledge__kav>)results[0];

            for (Knowledge__kav art : articles) {
                lines.add('Title: ' + art.Title);
                lines.add('Body: ' + art.Article_Body__c);
            }

            Response res = new Response();
            res.context = String.join(lines, '\n');
            responses.add(res);
        }

        return responses;
    }
}