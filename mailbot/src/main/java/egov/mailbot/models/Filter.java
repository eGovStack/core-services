package egov.mailbot.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Filter {

    @JsonProperty("type")
    private FilterType filterType = null;

    @JsonProperty("value")
    private List<String> value = null;
}
