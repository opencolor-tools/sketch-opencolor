
#import "WindowManager.h"
#import <JavaScriptCore/JavaScriptCore.h>


@implementation WindowManager

+ (instancetype)sharedInstance {
    static id instance = nil;
    static dispatch_once_t onceToken;
    
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] init];
    });
    
    return instance;
}

- (instancetype)init {
    self = [super init];
    if(!self) return self;
    return self;
}

+ (void)start {
    
    //trigger init to create window instance
    [WindowManager sharedInstance];
    
    NSLog(@"STARTING FROM FRAMEWORK, YES!");
}

+ (void)doItWithACallback:(MOJavaScriptObject *)callback {
    
    NSLog(@"Got callback: %@", callback);
    
    id result = [self callJavaScriptFunction:callback withArgumentsInArray:nil];
    
    NSLog(@"Got some result: %@", result);
}


+ (JSValue *)callJavaScriptFunction:(MOJavaScriptObject *)object withArgumentsInArray:(NSArray *)args {
    
    JSContext *ctx = [JSContext contextWithJSGlobalContextRef:(JSGlobalContextRef)object.JSContext];
    JSObjectRef fn = [object JSObject];
    JSValue *value = [JSValue valueWithJSValueRef:fn inContext:ctx];
    JSValue *result = [value callWithArguments:args];
    
    return result;
}


@end
