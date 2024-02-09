import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SignInValidation } from "@/lib/validation"
import Loading from "@/components/shared/Loading"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { useUserContext } from "@/context/AuthContext"
import { useSignInAccount } from "@/lib/react-query/queries"

const SignInForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const { mutateAsync: signInAccount } = useSignInAccount();

  // 1. Define your form.
  const form = useForm<z.infer<typeof SignInValidation>>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // 2. Define a submit handler.
  const onSubmit = async (user: z.infer<typeof SignInValidation>) => {

    try {
      const session = await signInAccount({
        email: user.email,
        password: user.password
      })

      if (!session) {
        return toast({
          title: "Sign in failed, Please try again.",
        })
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();

        navigate("/", { replace: true });
      } else {
        toast({ title: "Login failed. Please try again.", });
        return;
      }
    } catch (error) {
      console.log({ error })
    }
  }

  return (
    <Form {...form}>

      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo"></img>
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          Log in to your account
        </h2>

        <p className="text-light-3 small-medium md:base-regular">
          Welcome back! Please enter your details
        </p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
            {isUserLoading ? (
              <div className="flex-center gap-2">
                <Loading /> Loading...
              </div>
            ) : ("Sign In")}
          </Button>

          <p className="text-small-regular text-white text-center mt-2">
            Have no account yet?
            <Link to="/sign-up" className="text-purple-400 text-small-semibold ml-1">Sign Up</Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignInForm