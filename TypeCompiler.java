import java.util.*;
import java.io.*;

class TypeCompiler {

    enum STATE {
        NULL, INITIAL, DECLARATION, TERMINAL, NEEDS_VALUE
    }

    public static final String[] TERMINALS = {";"};

    private STATE state = STATE.INITIAL;
    private ArrayList<String> SYMBOL_TABLE;

    public static void main(String[] arguments) {
        System.out.println("testing, testing");

        TypeCompiler compiler = new TypeCompiler();
        compiler.compile("sample.mystery");
    }

    public TypeCompiler() {
        System.out.println("constructor");

        SYMBOL_TABLE = new ArrayList<>();
    }

    private void getFile(String fileName) {
        try (BufferedReader bufferedReader = new BufferedReader(new FileReader(fileName))) {
            String currentLine = null;

            while (bufferedReader.ready()) {
                currentLine = bufferedReader.readLine();

                if (currentLine.startsWith("#")) {
                    continue;
                }

                String[] allTokens = currentLine.split("\\s*\\b\\s*");

                ArrayList<String> tokens = new ArrayList<String>(Arrays.asList(allTokens));
//                tokens.addAll(allTokens);
                java.util.stream.Stream<String> stream =
                        tokens.stream()
                                .map(s -> s.trim())
                                .filter(p -> !p.isEmpty());

                processStream(stream);
            }

        } catch (FileNotFoundException fileNotFoundException) {
            fileNotFoundException.printStackTrace();
        } catch (IOException inputOutputException) {
            inputOutputException.printStackTrace();
        } catch (Exception exception) {
            exception.printStackTrace();
        }
    }

    private void processStream(java.util.stream.Stream<String> stream) {

        stream.map(string -> {
            switch (state) {
                case NULL:
                    return "";

                case INITIAL:
                    return switchInitial(string).unwrapped.toString();

                case DECLARATION:
                    return switchDeclaration(string).unwrapped.toString();

                default:
                    return string;
            }
        }).forEach(string -> System.out.println(string));
    }

    enum Keyword {
        CONST, LET, VAR, FUNCTION
    }

    private static Map<Keyword, String> keywords = keywords();
    private static Map<String, Keyword> lookupTable = buildLookupTable();

    private static Map<Keyword, String> keywords() {
        Map<Keyword, String> keywords = new TreeMap<>();

        keywords.put(Keyword.CONST, "const");
        keywords.put(Keyword.LET, "let");
        keywords.put(Keyword.VAR, "var");
        keywords.put(Keyword.FUNCTION, "function");

        return keywords;
    }

    private static Map<String, Keyword> buildLookupTable() {

        Map<String, Keyword> localLookupTable = new TreeMap<>();

        if (keywords.isEmpty()) {
            keywords = keywords();
        }

        keywords.entrySet().stream().forEach(mapEntry -> {
            Keyword key = mapEntry.getKey();
            String value = mapEntry.getValue();

            localLookupTable.put(value.toUpperCase(), key);
            localLookupTable.put(value.toLowerCase(), key);
        });

        return localLookupTable;

    }

    class GenericWrapper<T> {
        public final T unwrapped;

        public GenericWrapper(T thingToWrap) {
            this.unwrapped = thingToWrap;
        }
    }

    private GenericWrapper<String> switchInitial(String string) {

        if (lookupTable.containsKey(string)) {
            state = STATE.DECLARATION;
            String token = String.format("^^_KEYWORD<%s>", string);
            return new GenericWrapper(token);
        }

        return new GenericWrapper("");
    }

    private GenericWrapper<String> switchDeclaration(String string) {
        String token;

        if (Arrays.asList(TERMINALS).contains(string)) {
            state = STATE.TERMINAL;
            token = String.format(".._TERMINAL<%s>", string);
        } else if (string.equals("=")) {
            state = STATE.NEEDS_VALUE;
            token = String.format("==_AWAIT_ASSIGNMENT<%s>", string);
        } else {
            SYMBOL_TABLE.add(string);
            token = String.format("--_SYMBOL<%s>", string);
        }

        return new GenericWrapper(token);
    }

    private String getToken(String string) {
        return string;
    }

    public void compile(String fileName) {
        System.out.println("compile start");

        getFile(fileName);

        System.out.println("compile end");
    }
}