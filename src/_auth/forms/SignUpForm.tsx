import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SignUpValidation } from "@/lib/validation"
import Loading from "@/components/shared/Loading"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { useUserContext } from "@/context/AuthContext"
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queries"
// import { createUserAccount, signInAccount } from "@/lib/appwrite/api"

const SignUpForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isPending: isSignInAccount } = useSignInAccount();

  // 1. Define your form.
  const form = useForm<z.infer<typeof SignUpValidation>>({
    resolver: zodResolver(SignUpValidation),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  })

  // 2. Define a submit handler.
  const onSubmit = async (user: z.infer<typeof SignUpValidation>) => {

    try {
      const newUser = await createUserAccount(user);

      if (!newUser) {
        return toast({
          title: "Sign up failed, Please try again.",
        })
      }

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

        navigate("/");
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
          Create a new accounts
        </h2>

        <p className="text-light-3 small-medium md:base-regular">
          To use the app, please enter the details
        </p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            {isCreatingAccount || isSignInAccount || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loading /> Loading...
              </div>
            ) : ("Sign Up")}
          </Button>

          <p className="text-small-regular text-white text-center mt-2">
            Already have an account?
            <Link to="/sign-in" className="text-purple-400 text-small-semibold ml-1">Log In</Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignUpForm