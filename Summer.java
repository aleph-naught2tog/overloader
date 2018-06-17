public class Summer {
  private interface Adder {
    int add(int firstNumber, int secondNumber);
  }
  
  public static void main(String[] arguments) {
    Adder adder = (a,b) -> a + b;
    
    System.out.println("adder.add(1,2) = " + adder.add(1,2));
    // System.out.println("adder.add((1,2)) = " + adder.add((1,2))); 
    // System.out.println("adder.add(1,(2,3)) = " + adder.add(1,(2,3)));
  }
}
