import { HfInference } from "@huggingface/inference";
import { HUGGING_FACE_TOKEN } from "../../config/index.js";
import { sentenceSimilarity } from "@huggingface/inference";
///Integration with huggingface to check the similarity of the userResponse to the correct response

export async function evaluateResponse(userResponse, correctResponses) {
    const hf = new HfInference(HUGGING_FACE_TOKEN);
    try {
        const modelId = "BAAI/bge-m3";
        const queryData = {
            source_sentence: userResponse,
            sentences: correctResponses

        };
        let res = await hf.sentenceSimilarity({
            model: modelId,
            inputs: queryData,
        })
        console.log(res);
        const roundedRes = res.map((value) => Math.round(value *100));
        const evaluation = Math.max(...roundedRes);
        console.log(correctResponses, userResponse, evaluation)
        return evaluation;
    } catch (err) {
        console.error("Error evaluating with huggingFace:", err);
        throw err;
    }
};