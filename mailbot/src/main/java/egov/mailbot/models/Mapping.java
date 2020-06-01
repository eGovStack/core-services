package egov.mailbot.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Mapping {

    @JsonProperty("additionalFields")
    private JsonNode additionalFields = null;

    @JsonProperty("version")
    private String version = null;

    @JsonProperty("description")
    private String description = null;

    @JsonProperty("action")
    private Action action = null;

    @JsonProperty("filters")
    private List<Filter> filters = null;

    @JsonProperty("successResponse")
    private String successResponse = null;

    @JsonProperty("errorResponse")
    private String errorResponse = null;

}
